import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isApiError } from "./api-error";

export const handleApiError = (error: unknown) => {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.status },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "A preorder with this unique value already exists",
        },
        { status: 409 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message: "Related preorder data was not found",
        },
        { status: 422 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Preorder not found",
        },
        { status: 404 },
      );
    }
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
    },
    { status: 500 },
  );
};
