import sendMail from "@/utils/SendMail";

export default async function handler(req, res) {

  const { to, subject, htmlContent } = req.query;

  switch (req.method) {
    case "POST":
      const { to, subject, html } = req.body
      if (to) {
        let email = await sendMail(to, subject, html)
        res.status(200).send("E-Mail Sent");
      } else {
        res.status(401).send("E-Mail is not found");
      }
    default:
      break;
  }
}