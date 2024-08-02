import { secureAccess } from "@/utils/Apiconfig";
import { employees, getAdminCollection } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const authsData = await getAdminCollection();
  const employDetails = await employees();
  const isAccessGranted = await secureAccess(req, res);
  const { emp_id, id, email } = req?.query;

  switch (req.method) {
    case "GET":
      if (email) {
        const auths = await authsData.findOne({ email });
        const employ = await employDetails.findOne({ email });
        if (auths) {
          return res.status(200).json(auths)
        }
        else if (employ) {
          return res.status(200).json(employ)
        }
        else {
          return res.status(404).json({ message: "User not found" });
        }
      }
      if (id) {
        const Employe = await employDetails.findOne({ _id: new ObjectId(id) });
        if (!Employe) {
          return res.status(200).json({ message: "User not found" });
        } else {
          return res.status(200).json(Employe);
        }
      } else if (emp_id) {
        const Employe = await employDetails.findOne({ emp_id: emp_id });
        if (!Employe) {
          return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(Employe);
      } else {
        var Employes = await employDetails.find().sort({ join_date: 1 }).toArray();
        return res.status(200).json(Employes);
      }
    case "POST":

      if (!req.body) {
        return res.status(200).json({ message: "Please add Data" });
      } else {
        var result = await employDetails.insertOne({ ...req.body });
        return res.status(200).json(result);
      }
    case "PUT":
      var updateEmp = await employDetails.updateOne(
        { _id: new ObjectId(emp_id) },
        { $set: { ...req.body } },
        { returnOriginal: false }
      );
      if (!updateEmp) {
        return res.status(404).json({ message: "Employ not found" });
      }
      res.status(200).json(updateEmp);
      break;

    case "DELETE":
      if (id) {
        const employ = await employDetails.deleteOne({ _id: new ObjectId(id) });
        if (employ.deletedCount === 0) {
          return res.status(404).json({ message: "Employ not found" });
        }
        res.status(200).json({ message: `Employ Deleted ${id}` });
      } else if (emp_id) {
        const employ = await employDetails.deleteOne({
          emp_id,
        });
        if (employ.deletedCount === 0) {
          return res.status(404).json({ message: "Employ not found" });
        }
        res.status(200).json({ message: `Employ Deleted ${emp_id}` });
      }
      break;
    default:
      res.status(200).json({ message: "method not allowed" });
  }
}
