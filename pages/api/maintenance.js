import { getMaintenance } from "../../lib/storage";
export default function handler(req, res) {
  res.status(200).json(getMaintenance());
}
