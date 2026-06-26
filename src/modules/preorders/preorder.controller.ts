import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { preorderService } from "./preorder.service";

export const preorderController = {
  async list(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
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

  async create(request: NextRequest) {
    try {
      const body = await request.json();
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

  async get(_request: NextRequest, id: string) {
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

  async update(request: NextRequest, id: string) {
    try {
      const body = await request.json();
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

  async updateStatus(request: NextRequest, id: string) {
    try {
      const body = await request.json();
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

  async delete(_request: NextRequest, id: string) {
    try {
      const result = await preorderService.delete(id);

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
};
