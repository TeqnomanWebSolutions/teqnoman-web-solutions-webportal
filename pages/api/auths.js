import { ObjectId } from "mongodb";  

export default async function handler(req, res) {
  const authsData = await getAuthsCollection();

  const { email, id, emp_id } = req.query;

  switch (req.method) {
    case "GET":
      if (email) {
        const auths = await authsData.findOne({ email });
        if (!auths) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(auths);

      }
      else if (id) {
        const Employe = await authsData.findOne({ _id: new ObjectId(id) });
        if (!Employe) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(Employe);
      } else {
        const auths = await authsData.find().toArray();
        res.status(200).json(auths);
      }
      break;

    case "PUT":
      var result = await authsData.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...req.body } },
        { returnOriginal: false }
      );
      if (!result.value) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(result.value);
      break;

    case "POST":
      var result = await authsData.insertOne(req.body);
      res.status(201).json({ message: "add success" });
      break;

    case "DELETE":
      if (id) {
        var result = await authsData.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted" });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
