import { NextRequest, NextResponse } from "next/server";

import { preorderService } from "./preorder.service";
import { handleApiError } from "@/errors/error-handler";

export const preorderController = {
  list: async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const result = await preorderService.list(searchParams);

      return NextResponse.json({
        success: true,
        message: "Preorders fetched successfully",
        data: result.data,
        total: result.meta.total,
        page: result.meta.page,
        perPage: result.meta.perPage,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await preorderService.create(body);

      return NextResponse.json(
        {
          success: true,
          message: "Preorder created successfully",
          data,
        },
        { status: 201 },
      );
    } catch (error) {
      return handleApiError(error);
    }
  },

  get: async (_req: NextRequest, id: string) => {
    try {
      const data = await preorderService.getById(id);

      return NextResponse.json({
        success: true,
        message: "Preorder fetched successfully",
        data,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (req: NextRequest, id: string) => {
    try {
      const body = await req.json();
      const data = await preorderService.update(id, body);

      return NextResponse.json({
        success: true,
        message: "Preorder updated successfully",
        data,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateStatus: async (req: NextRequest, id: string) => {
    try {
      const body = await req.json();
      const data = await preorderService.updateStatus(id, body.status);

      return NextResponse.json({
        success: true,
        message: "Preorder status updated successfully",
        data,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (_req: NextRequest, id: string) => {
    try {
      const result = await preorderService.delete(id);

      return NextResponse.json({
        ...result,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
};
