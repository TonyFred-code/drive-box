import {
  DIRECTORY_ERROR_CODES,
  PRISMA_ERROR_CODES,
} from "../constants/errorCodes.js";
import {
  createDirectory as prismaCreateDirectory,
  updateDirectory as prismaUpdateDirectory,
  deleteDirectory as prismaDeleteDirectory,
} from "../db/directory.js";
import { handleUniqueConstraintError } from "../lib/prismaUtils.js";

async function createDirectory(req, res) {
  const { name, parentId } = req.body;
  const user = req.user;

  try {
    const directory = await prismaCreateDirectory(name, user.id, parentId);

    return res.json({
      success: true,
      data: {
        ...directory,
      },
    });
  } catch (error) {
    let errMsgObj = { msg: "", field: "" };
    let errStatus = 500;
    switch (error.code) {
      case DIRECTORY_ERROR_CODES.PARENT_DIRECTORY_NOT_FOUND:
        errStatus = 404;
        errMsgObj.field = "form";
        errMsgObj.msg = "Parent directory not found";
        break;

      case DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED:
        errStatus = 403;
        errMsgObj.field = "form";
        errMsgObj.msg = "You do not have access to create this directory";
        break;

      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAIN_VIOLATION:
        const violatingFields = handleUniqueConstraintError(error);

        if (violatingFields.length === 0) {
          errStatus = 500;
          errMsgObj.field = "form";
          errMsgObj.msg = "An unknown error occurred";
        } else {
          errStatus = 409;
          errMsgObj.field = "form";
          errMsgObj.msg =
            "A directory with this name already exists in this directory.";
        }
        break;

      default:
        errMsgObj.msg = "An unknown error occurred";
        errMsgObj.field = "form";
        break;
    }
    return res.status(errStatus).json({
      success: false,
      error: [errMsgObj],
    });
  }
}

async function deleteDirectory(req, res) {
  const { id } = req.params;
  const user = req.user;

  try {
    const directory = await prismaDeleteDirectory(id, user.id);
    return res.json({
      success: true,
      data: {
        ...directory,
      },
    });
  } catch (error) {
    let errMsgObj = { msg: "", field: "" };
    let errStatus = 500;

    switch (error.code) {
      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
      case DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND:
        errStatus = 404;
        errMsgObj.field = "form";
        errMsgObj.msg = "Directory not found";
        break;

      case DIRECTORY_ERROR_CODES.ROOT_DIRECTORY_CANNOT_BE_DELETED:
        errStatus = 403;
        errMsgObj.field = "form";
        errMsgObj.msg = "Root directory cannot be deleted";
        break;

      case DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED:
        errStatus = 403;
        errMsgObj.field = "form";
        errMsgObj.msg = "You do not have permission to delete this directory";
        break;

      default:
        errMsgObj.msg = "An unknown error occurred";
        errMsgObj.field = "form";
        break;
    }

    return res.status(errStatus).json({
      success: false,
      error: [errMsgObj],
    });
  }
}

async function updateDirectory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const malFormedErrMsg = [];

  if (!id) {
    malFormedErrMsg.push({
      msg: "Directory id is a missing required field.",
      field: "id",
    });
  }

  if (!name) {
    malFormedErrMsg.push({
      msg: "Directory name is a missing required field",
      field: "name",
    });
  }

  if (malFormedErrMsg.length > 0) {
    return res.status(400).json({
      success: false,
      error: malFormedErrMsg,
    });
  }

  const user = req.user;

  try {
    const directory = await prismaUpdateDirectory(id, user.id, name);

    const { userId, ...directoryWithoutUserId } = directory;
    return res.json({
      success: true,
      data: {
        ...directoryWithoutUserId,
      },
    });
  } catch (error) {
    let errMsgObj = { msg: "", field: "" };
    let errStatus = 500;

    switch (error.code) {
      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
      case DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND:
        errStatus = 404;
        errMsgObj.field = "form";
        errMsgObj.msg = "Directory not found";
        break;

      case DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED:
        errStatus = 403;
        errMsgObj.field = "form";
        errMsgObj.msg = "You do not have permission to update this directory";
        break;

      case DIRECTORY_ERROR_CODES.ROOT_DIRECTORY_CANNOT_BE_UPDATED:
        errStatus = 403;
        errMsgObj.field = "form";
        errMsgObj.msg = "Root directory cannot be updated";
        break;

      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAIN_VIOLATION:
        errStatus = 409;
        errMsgObj.field = "form";
        errMsgObj.msg =
          "A directory with this name already exists in the parent directory";
        break;

      default:
        errMsgObj.msg = "An unknown error occurred";
        errMsgObj.field = "form";
        break;
    }

    return res.status(errStatus).json({
      success: false,
      error: [errMsgObj],
    });
  }
}

export { createDirectory, updateDirectory, deleteDirectory };
