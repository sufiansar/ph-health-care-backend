import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { MetaDataService } from "./metaData.service";

const fetchMetaDataDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await MetaDataService.fetchMetaDataDashboard(user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "MetaData fetched Successfully!!!",
      data: result,
    });
  }
);

export const MetaDataController = {
  fetchMetaDataDashboard,
};
