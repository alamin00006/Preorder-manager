import { NextRequest, NextResponse } from "next/server";

import { preorderService } from "./preorder.service";
import { handleApiError } from "@/errors/error-handler";

export const preorderController = {
  async list(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const result = await preorderService.list(searchParams);

      return NextResponse.json({
        success: true,
        message: "Preorders fetched successfully",
        ...result,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(req: NextRequest) {
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

  async get(_req: NextRequest, id: string) {
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

  async update(req: NextRequest, id: string) {
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

  async updateStatus(req: NextRequest, id: string) {
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

  async delete(_req: NextRequest, id: string) {
    try {
      const result = await preorderService.delete(id);

      return NextResponse.json({
        // success: true,
        ...result,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
};
