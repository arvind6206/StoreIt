export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

export function generateOTPExpiry(minutes: number = 10): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
}
