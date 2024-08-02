import { secureAccess } from "@/utils/Apiconfig";
import { getAdminCollection } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const adminData = await getAdminCollection();
  const isAccessGranted = await secureAccess(req, res);
  const { id } = req?.query;

  switch (req.method) {
    case "GET":
      if (id) {
        const admin = await adminData.findOne({ _id: new ObjectId(id) });
        if (!admin) {
          return res.status(404).json({ message: "admin not found" });
        }
        res.status(200).json(admin);
      } else {
        var admins = await adminData.find().sort({ date: -1 }).toArray();
        res.status(200).json(admins);
      }
      break;
    case "POST":

      if (!req.body) {
        return res.status(200).json({ message: "Please add Data" });
      } else {
        var result = await adminData.insertOne({ ...req.body });
        return res.status(200).json(result);
      }
    case "PUT":
      
      var result = await adminData.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { returnOriginal: false }
      );
      if (!result) {
        return res.status(404).json({ message: "admin not found" });
      }
      res.status(200).json(result.value);
      break;

    // case "DELETE":
    //   if (id) {
    //     const admin = await adminData.deleteOne({
    //       _id: new ObjectId(id),
    //     });
    //     if (admin.deletedCount === 0) {
    //       return res.status(404).json({ message: "admin not found" });
    //     }
    //     res.status(200).json({ message: `admin Deleted ${id}` });
    //   }
    //   return res.status(200).json({ message: `Enter admin ID to Delete` });
    default:
      res.status(200).json({ message: "method not allowed" });
  }
}
