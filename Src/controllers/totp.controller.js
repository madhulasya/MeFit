import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { User } from "../models/index.d.js";
import { createToken } from "../configs/jwt.config.js";

// Start TOTP setup: returns otpauth URL and QR image data URL
export const startTotpSetup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({
      name: `MEFIT (${user.email})`,
      length: 20,
    });

    const otpauthUrl = secret.otpauth_url;
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Temporarily hold secret on the user until verification
    user.twoFactorSecret = secret.base32;
    await user.save();

    return res.status(200).json({ otpauthUrl, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Verify TOTP and enable 2FA
export const verifyTotp = async (req, res) => {
  try {
    const { token } = req.body; // 6-digit code
    const userId = req.user?.id;

    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findById(userId).select("twoFactorSecret twoFactorEnabled");
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: "TOTP not initiated" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) return res.status(400).json({ message: "Invalid token" });

    user.twoFactorEnabled = true;
    await user.save();
    return res.status(200).json({ message: "2FA enabled" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// During login step 2: Verify TOTP code and issue JWT
export const verifyTotpLogin = async (req, res) => {
  try {
    const { userId, token } = req.body; // from step1 response
    if (!userId || !token) return res.status(400).json({ message: "userId and token are required" });

    const user = await User.findById(userId).select("twoFactorSecret twoFactorEnabled email name roles");
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret)
      return res.status(400).json({ message: "2FA not enabled" });

    const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token, window: 1 });
    if (!ok) return res.status(401).json({ message: "Invalid token" });

    const jwt = createToken({ id: user._id, email: user.email, roles: user.roles }, "1h");
    return res.status(200).json({ message: "2FA verified", token: jwt });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};