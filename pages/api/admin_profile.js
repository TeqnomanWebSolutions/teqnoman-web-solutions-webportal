import { ObjectId } from "mongodb";
import { getAdminData, getAuthsCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {
  const adminData = await getAdminData();
  const isAccessGranted = await secureAccess(req, res);
  const { admin_id, id } = req.query;

  switch (req.method) {
    case "GET":
      if (admin_id) {
        const admin = await adminData.findOne({ admin_id });
        const auth = await authData.findOne({ _id: new ObjectId(admin_id) });
        const data = {
          admin_id: admin.admin_id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          email: auth.email,
          password: auth.password,
          profile_image: admin.profile_image,
        };
        if (!admin_id) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(data);
      } else {
        const admin = await adminData.find().toArray();
        const auth = await authData.find().toArray();
        let mergedData = [];
        for (let i = 0; i < admin.length; i++) {
          for (let j = 0; j < auth.length; j++) {
            if (admin[i].admin_id == auth[j]._id) {
              mergedData.push({
                id: admin[i].admin_id,
                first_name: admin[i].first_name,
                last_name: admin[i].last_name,
                email: auth[j].email,
                password: auth[j].password,
                profile_image: admin[i].profile_image,
              });
            }
          }
        }
        res.status(200).json(mergedData);
      }
      break;

    case "POST":
      const { first_name, last_name, email, password } = req.body;
      var addAuth = await authData.insertOne({
        email,
        password,
        onboarding: "false",
        role: "admin",
        status: "active",
      });
      var addAdmin = await adminData.insertOne({
        first_name,
        last_name,
        admin_id: addAuth.insertedId.toString(),
      });
      if (!addAdmin) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "add success" });
      break;

    case "PUT":
      if (admin_id) {
        const { first_name, last_name, email, password } = req.body;
        var result1 = await adminData.findOneAndUpdate(
          { admin_id: admin_id },
          { $set: { first_name, last_name } },
          { returnOriginal: false }
        );
        var result2 = await authData.findOneAndUpdate(
          { _id: new ObjectId(admin_id) },
          { $set: { email, password } },
          { returnOriginal: false }
        );
        if (!result1.value && !result2.value) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Data updated!" });
      }
      break;

    case "DELETE":
      if (admin_id) {
        var result = await adminData.deleteOne({ admin_id });
        var result = await authData.deleteOne({ _id: new ObjectId(admin_id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted" });
      }
      return res.status(200).json({ message: `Enter user ID to Delete` });

    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
