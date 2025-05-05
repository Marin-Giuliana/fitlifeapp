import dbConnect from '../../lib/mongodb';

export async function GET(){
    
    try {
    await dbConnect();
    return new Response(JSON.stringify({result: "Hello world"}));
    } catch (error){
        return new Response(JSON.stringify({result: "Error"}));
    }
}

// import dbConnect from '../../lib/mongodb';
// import Item from '../../models/Item';

// export default async function handler(req, res) {
//   await dbConnect();

//   const { method } = req;

//   switch (method) {
//     case 'GET':
//       try {
//         const items = await Item.find({});
//         res.status(200).json({ success: true, data: items });
//       } catch (error) {
//         res.status(400).json({ success: false });
//       }
//       break;
//     case 'POST':
//       try {
//         const item = await Item.create(req.body);
//         res.status(201).json({ success: true, data: item });
//       } catch (error) {
//         res.status(400).json({ success: false });
//       }
//       break;
//     default:
//       res.status(400).json({ success: false });
//       break;
//   }
// }