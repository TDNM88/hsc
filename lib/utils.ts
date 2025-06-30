import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Định dạng số thành chuỗi VND với dấu phẩy hàng nghìn
export function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
}
