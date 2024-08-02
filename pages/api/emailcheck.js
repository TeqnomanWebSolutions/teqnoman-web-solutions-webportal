import { employees, getAdminCollection } from "@/utils/mongodb";

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const users = await employees();
  const admins = await getAdminCollection();
  const { email } = req.body;
  const user = await users.findOne({ email });
  const admin = await admins.findOne({ email });
  if (admin) {
    return res.status(200).json({ exists: true, username: admin.first_name + " " + admin.last_name, id: admin._id, role: 'admin' });
  } else if (user) {
    if (user.status === "deactive") return res.status(200).json({ exists: false, deactive: true });
    return res.status(200).json({ exists: true, username: user.first_name + " " + user.last_name, id: user._id, role: "employee" });
  }
  else {
    return res.status(200).json({ exists: false });
  }
}
