import { NextRequest } from 'next/server'
import { preorderController } from '@/modules/preorders/preorder.controller'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return preorderController.updateStatus(request, id)
}
