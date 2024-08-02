import { secureAccess } from "@/utils/Apiconfig";
import { emp_general_detail } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const generalDetails = await emp_general_detail();
  const isAccessGranted = await secureAccess(req, res);
  const { emp_id, id } = req?.query;

  switch (req.method) {
    case "GET":
      if (id) {
        const employ = await generalDetails.findOne({ _id: new ObjectId(id) });
        if (!employ) {
          return res.status(404).json({ message: "employ not found" });
        }
        res.status(200).json(employ);
      } else if (emp_id) {
        var result = await generalDetails.findOneAndUpdate(
          { emp_id: emp_id },
          { $set: { ...req.body } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(result.value);
      } else {
        var employ = await generalDetails.find().toArray();
        res.status(200).json(employ);
      }
      break;

    case "POST":
      if (!req.body) {
        return res.status(200).json({ message: "Please add Data" });
      } else {
        var result = await generalDetails.insertOne(req.body);
        res.status(200).json({ ...req.body });
      }
      break;

    case "PUT":
      if (id) {
        var result = await generalDetails.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...req.body } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(result.value);
      } else if (emp_id) {
        var result = await generalDetails.findOneAndUpdate(
          { emp_id: emp_id },
          { $set: { ...req.body } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(result.value);
      } else {
        return res.status(404).json({ message: "Require ID To Update Data" });
      }
      break;

    case "DELETE":
      if (id) {
        const employ = await generalDetails.deleteOne({
          _id: new ObjectId(id),
        });
        if (employ.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: `User Deleted ${id}` });
      }

      break;
    default:
      res.status(200).json({ message: "method not allowed" });
  }
}
