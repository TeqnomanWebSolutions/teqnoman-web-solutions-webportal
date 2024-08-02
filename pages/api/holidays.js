import { secureAccess } from "@/utils/Apiconfig";
import { getHolidayCollection } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const holidays = await getHolidayCollection();
  const isAccessGranted = await secureAccess(req, res);
  const { id } = req.query

  switch (req.method) {
    case "GET":
      const holidayList = await holidays.find().sort({ holiday_date: 1 }).toArray();
      if (holidayList) {
        return res.status(200).json(holidayList);
      }
      return res.status(404).json({ message: "error" });
    case "POST":
      if (!req.body) {
        return res.status(404).json({ message: "Please add Data" });
      } else {
        const { holiday_name, holiday_date } = req.body
        var result = await holidays.insertOne({ holiday_name, holiday_date });
        return res.status(200).json(req.body);
      }
    case "PUT":
      if (id) {
        var result = await holidays.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...req.body } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "Holiday Not Found" });
        }
        return res.status(200).json(result.value);
      } else {
        return res.status(404).json({ message: "Require ID To Update Data" });
      }
    case "DELETE":
      if (id) {
        const holiday = await holidays.deleteOne({
          _id: new ObjectId(id),
        });
        if (holiday.deletedCount === 0) {
          return res.status(404).json({ message: "Holiday not found" });
        }
        return res.status(200).json({ message: `Holiday Deleted ${id}` });
      }

    default:
      return res.status(200).json({ message: "method not allowed" });
  }
}