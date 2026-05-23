import { useState } from "react";
import { useTwoFactorAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function TwoFactorSetup() {
  const { setup2FA, verify2FA, isLoading, error } = useTwoFactorAuth();
  const [step, setStep] = useState("setup"); // setup | verify | done
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSetup = async () => {
    try {
      const data = await setup2FA();
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setBackupCodes(data.backup_codes);
      setStep("verify");
    } catch (err) {
      console.error("2FA setup error:", err);
    }
  };

  const handleVerify = async () => {
    try {
      await verify2FA(verificationCode, secret);
      setStep("done");
    } catch (err) {
      console.error("2FA verification error:", err);
    }
  };

  if (step === "setup") {
    return (
      <div className="flex flex-col gap-4 p-6 border rounded-lg">
        <h3 className="font-semibold">Enable Two-Factor Authentication</h3>
        <p className="text-gray-600 text-sm">
          Secure your account with 2FA using an authenticator app.
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleSetup} disabled={isLoading}>
          {isLoading ? "Setting up..." : "Get Started"}
        </Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-4 p-6 border rounded-lg">
        <h3 className="font-semibold">Scan QR Code</h3>
        {qrCode && (
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
        )}
        <p className="text-gray-600 text-sm">
          Scan this code with Google Authenticator or Authy
        </p>
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength="6"
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleVerify} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col gap-4 p-6 border border-green-500 rounded-lg bg-green-50">
        <h3 className="font-semibold text-green-700">✓ 2FA Enabled!</h3>
        <p className="text-sm text-gray-700">
          Save these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
        </p>
        <div className="bg-white p-3 rounded border border-gray-200">
          {backupCodes.map((code, idx) => (
            <div key={idx} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <Button className="bg-green-600 hover:bg-green-700">Done</Button>
      </div>
    );
  }
}
