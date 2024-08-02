import { ObjectId } from "mongodb";
import { getBlogCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

  const blogCollection = await getBlogCollection();
  const { id } = req.query;
  const isAccessGranted = await secureAccess(req, res);
  switch (req.method) {
    case "GET":
      if (id) {
        const user = await blogCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
          return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(user);
      } else {
        var users = await blogCollection.find().sort({ date: -1 }).toArray();
        res.status(200).json(users);
      }
      break;

    case "POST":
      const { blogText, blogUrl, readTime, author, keyword, shortDes, featureImg, imageAlt, metaTitle, metaDes, date, category, blogdescription, blogTags, } = req.body;
      const status = "draft";
      const newUser = { blogText, status, blogUrl, readTime, author, keyword, shortDes, featureImg, imageAlt, metaTitle, metaDes, date, category, blogdescription, blogTags, };
      const result = await blogCollection.insertOne(newUser);
      res.status(201).json(result);
      break;

    case "PUT":
      if (id) {
        let result1 = await blogCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: req.body },
          { returnOriginal: false }
        );
        if (!result1.value) {
          return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(result1.value);
      }
      else {
        res.status(404).json({ message: "Insert ID" });
      }
      break;

    case "DELETE":
      if (id) {
        var deleteResult = await blogCollection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted" });
      } else {
        res.status(404).json({ message: "Insert Delete ID" });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
