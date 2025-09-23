import { NextResponse } from "next/server"

export function success(message: string, data: any, status = 200) {
  return NextResponse.json(
    {
      status: "success",
      message,
      data,
    },
    { status }
  )
}

export function fail(message: string, data: any = null, status = 400) {
  return NextResponse.json(
    {
      status: "fail",
      message,
      data,
    },
    { status }
  )
}