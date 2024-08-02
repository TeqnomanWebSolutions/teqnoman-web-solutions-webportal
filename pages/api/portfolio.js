import { ObjectId } from "mongodb";
import { getPortfolioCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

  const portfolioCollection = await getPortfolioCollection();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      if (id) {
        const data = await portfolioCollection.findOne({ _id: new ObjectId(id) });
        if (!data) {
          return res.status(404).json({ message: "Portfolio not found" });
        }
        res.status(200).json(data);
      } else {
        var allData = await portfolioCollection.find().sort({ date: -1 }).toArray();
        res.status(200).json(allData.sort((a, b) => a.order - b.order));
      }
      break;

    case "POST":
      const { name, image, order, featured, status } = req.body;
      const newData = { name, image, order, featured, status, created_date: new Date() };
      const result = await portfolioCollection.insertOne(newData);
      res.status(201).json(result);
      break;

    case "PUT":
      if (!id) {
        return res.status(404).json({ message: "Insert ID" });
      }
      let result1 = await portfolioCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: req.body },
        { returnOriginal: false }
      );
      if (!result1.value) {
        return res.status(404).json({ message: "Data not found" });
      }
      res.status(200).json(result1.value);
      break;

    case "DELETE":
      if (id) {
        var deleteResult = await portfolioCollection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: "Portfolio not found" });
        }
        res.status(200).json({ message: "Portfolio deleted" });
      } else {
        res.status(404).json({ message: "Insert Delete ID" });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
