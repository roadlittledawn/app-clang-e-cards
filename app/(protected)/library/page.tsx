import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import ImageModel from "@/models/Image";
import { s3PublicUrl } from "@/lib/s3-upload";
import Image from "next/image";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const images = await ImageModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Image Library</h1>
      {images.length === 0 ? (
        <p className="text-gray-400">No images yet. Upload one when creating a card.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img) => (
            <div key={img._id.toString()} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={s3PublicUrl(img.s3Key)}
                alt={img.filename}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
