import { ObjectId } from "mongodb";
import { getBlogCategoryCollection } from "../../utils/mongodb";
import bcrypt from 'bcryptjs'
import moment from "moment";

export default async function handler(req, res) {
    const blogCategoryCollection = await getBlogCategoryCollection();
    const { id, type } = req.query;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == undefined) {
        return res.status(401).json({ message: "Access Denied!" });
    }
    const hash = "teqnoman-web-solutions-web-portal";
    const getAccess = await bcrypt.compare(hash, token)

    if (!getAccess) {
        return res.status(401).json({ message: "Access Denied!" });
    }

    switch (req.method) {
        case "GET":
            if (id) {
                const category = await blogCategoryCollection.findOne({ _id: new ObjectId(id) });
                if (!category) {
                    return res.status(404).json({ message: "Category not found" });
                }
                res.status(200).json(category);
            } else if (type === "withCount") {
                let pipeLine = [
                    {
                        $lookup: {
                            from: "blogdata",
                            localField: "name",
                            foreignField: "category",
                            as: "totalData",
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            count: { $size: "$totalData" }
                        }
                    }
                ]
                var categories = await blogCategoryCollection.aggregate(pipeLine).toArray();
                res.status(200).json(categories);
            } else {
                var categories = await blogCategoryCollection.find().toArray();
                res.status(200).json(categories);
            }
            break;

        case "POST":
            const { name } = req.body;
            const newCategory = { name };
            const result = await blogCategoryCollection.insertOne(newCategory);
            res.status(201).json(req.body);
            break;

        case "PUT":
            var result1 = await blogCategoryCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: req.body },
                { returnOriginal: false }
            );
            if (!result1) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.status(200).json(result1);
            break;

        case "DELETE":
            if (id) {
                var result2 = await blogCategoryCollection.deleteOne({ _id: new ObjectId(id) });
                if (result2.deletedCount === 0) {
                    return res.status(404).json({ message: "category not found" });
                }
                res.status(200).json({ message: "category deleted" });
            }
            break;

        default:
            res.status(405).json({ message: "Method not allowed" });
            break;
    }
}
