import { getMedia } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const Media = await getMedia();
    const { id } = req.query;

    switch (req.method) {
        case "POST":
            let newMedia = await Media.insertOne(req.body);
            res.status(200).send(newMedia);
            break;

        case "DELETE":
            let deleteMedia = await Media.deleteOne({ _id: new ObjectId(id) });
            res.status(200).send(deleteMedia);
            break;

        default:
            break;
    }
}