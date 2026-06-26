import { NextRequest } from 'next/server'
import { preorderController } from '@/modules/preorders/preorder.controller'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return preorderController.get(_request, id)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return preorderController.update(request, id)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return preorderController.delete(_request, id)
}
