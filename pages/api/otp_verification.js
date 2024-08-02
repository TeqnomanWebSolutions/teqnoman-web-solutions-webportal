import { secureAccess } from "@/utils/Apiconfig";
import { getOTP } from "../../utils/mongodb";

export default async function handler(req, res) {

  const otpdata = await getOTP();
  const isAccessGranted = await secureAccess(req, res);
  const { email } = req.query

  switch (req.method) {
    case "GET":
      if (email) {
        const findotp = await otpdata.findOne({
          email: email,
        });
        if (!findotp) {
          return res.status(200).json({ ok: false });
        }
        res.status(200).json({ otp: findotp.otp, ok: true });
      } else {
        res.status(200).json({ ok: false });
      }
      break;

    case "PUT":
      var updateResult = await otpdata.findOneAndUpdate(
        { email: req.query.email },
        { $set: { ...req.body } },
        { upsert: true, returnOriginal: false }
      );
      res.status(200).json({ ok: true })
      break;


    case "DELETE":
      var result = await otpdata.deleteOne({ email: req.query.email });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Otp  details not found" });
      }
      res.status(200).json({ message: "Otp detail deleted" });
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
