import checkIfImageExists from "@/components/helper/backEnd/ImageCheck";
import storage from "@/utils/firebaseConfig";
import { PrismaClient } from "@prisma/client";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET;
const admin = process.env.NEXT_PUBLIC_ADMIN;

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      // User is not authenticated or authorId is missing
      return new NextResponse("User not logged in or authorId missing");
    }

    // Check if the user has already submitted an application
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: userId,
      },
    });

    if (existingApplication) {
      // User has already submitted an application
      return new NextResponse("User has already submitted an application", {
        status: 400,
      });
    }

    // Extract form data from the request
    const formData = await req.formData();

    // Use utility function for each form field
    const firstName = getStringValue(formData, "firstName");
    const lastName = getStringValue(formData, "lastName");
    const email = getStringValue(formData, "email");
    const fatherName = getStringValue(formData, "fatherName");
    const motherName = getStringValue(formData, "motherName");
    const birthDay = getStringValue(formData, "birthDay");
    const bloodGroup = getStringValue(formData, "bloodGroup");
    const mobileNumber = getStringValue(formData, "mobileNumber");
    const guardianNumber = getStringValue(formData, "guardianNumber");
    const gender = getStringValue(formData, "gender");
    const religion = getStringValue(formData, "religion");
    const fullAddress = getStringValue(formData, "fullAddress");
    const district = getStringValue(formData, "district");
    const education = getStringValue(formData, "education");
    const board = getStringValue(formData, "board");
    const rollNumber = getStringValue(formData, "rollNumber");
    const regNumber = getStringValue(formData, "regNumber");
    const passingYear = getStringValue(formData, "passingYear");
    const gpa = getStringValue(formData, "gpa");
    const nid = getStringValue(formData, "nid");
    const nationality = getStringValue(formData, "nationality");
    const course = getStringValue(formData, "course");
    const duration = getStringValue(formData, "duration");
    const pc = getStringValue(formData, "pc");
    const session = getStringValue(formData, "session");
    const transactionId = getStringValue(formData, "transactionId");
    const fatherOccupation = getStringValue(formData, "fatherOccupation");
    const maritalStatus = getStringValue(formData, "maritalStatus");
    const picture = formData.get("picture");

    try {
      // Ensure you have a valid filename and buffer before using them
      const filename = Date.now() + (picture as File).name.replaceAll(" ", "_");
      const buffer = Buffer.from(await (picture as Blob).arrayBuffer());

      // Upload file to Firebase storage
      const storageRef = ref(storage, "application/" + filename);
      await uploadBytes(storageRef, buffer);

      // Get download URL from Firebase storage
      const downloadURL = await getDownloadURL(storageRef);

      const lastApplication = await prisma.application.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          roll: true,
        },
      });
      if (!lastApplication || !lastApplication.roll) {
        return new NextResponse("There was an error. Please try again later.");
      }

      const roll = lastApplication?.roll + 1;

      // Create a new post using Prisma
      const newPost = await prisma.application.create({
        data: {
          firstName,
          lastName,
          fatherName,
          motherName,
          birthDay,
          bloodGroup,
          mobileNumber,
          guardianNumber,
          gender,
          religion,
          fullAddress,
          district,
          education,
          board,
          rollNumber,
          regNumber,
          passingYear,
          gpa,
          nid,
          nationality,
          course,
          duration,
          email,
          pc,
          userId,
          roll,
          transactionId,
          fatherOccupation,
          maritalStatus,
          session,
          image: downloadURL,
          status: "Pending",
          certificate: "Pending",
        },
      });

      return new NextResponse(JSON.stringify(newPost), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new NextResponse("Applications creation failed", { status: 400 });
    }
  } catch (error) {
    console.error("Error occurred while processing form data: ", error);
    return new NextResponse("Form data processing failed", { status: 500 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      return new NextResponse("User not logged in or authorId missing");
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        duration: true,
        image: true,
        status: true,
        course: true,
        createdAt: true,
        certificate: true,
      },
    });

    if (existingApplication) {
      return new NextResponse(JSON.stringify(existingApplication), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new NextResponse("No Application Found", { status: 200 });
    }
  } catch (error) {
    return new NextResponse("An error occurred", { status: 400 });
  }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;
    const userEmail = token?.email;

    if (!token || (!userId && !userEmail)) {
      return new NextResponse("User not logged in or userId/userEmail missing");
    }

    const search = req.nextUrl.searchParams;
    const applicationId = search.get("id");

    if (!applicationId) {
      return new NextResponse("Application ID not provided", { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        userId: true,
        image: true,
      },
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // Check if the user has the right to delete the application
    if (userId === application.userId || userEmail === admin) {
      if (await checkIfImageExists(application.image)) {
        // Delete the previous cover image
        const storageRefToDelete = ref(storage, application.image);
        await deleteObject(storageRefToDelete);
      }

      await prisma.application.delete({
        where: {
          id: applicationId,
        },
      });

      return new NextResponse("Application deleted successfully", {
        status: 200,
      });
    } else {
      // User does not have the right to delete the application
      return new NextResponse("Unauthorized to delete this application", {
        status: 403,
      });
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    return new NextResponse("Error deleting application", { status: 500 });
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;
    const userEmail = token?.email;

    if (!token || (!userId && !userEmail)) {
      return new NextResponse("User not logged in or userId/userEmail missing");
    }

    const formData = await req.formData();
    const id = getStringValue(formData, "id");
    const imageData = formData.get("image");
    // Check if the user exists
    const existingUser = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the user has an image in Firebase Storage
    if (existingUser.image && imageData) {
      const imageExists = await checkIfImageExists(existingUser.image);
      if (imageExists) {
        // Delete the previous cover image
        const storageRefToDelete = ref(storage, existingUser.image);
        await deleteObject(storageRefToDelete);
      }
    }
    // Upload the new cover image
    let image: string;

    if (imageData) {
      const filename =
        Date.now() + (imageData as File).name.replaceAll(" ", "_");
      const buffer = Buffer.from(await (imageData as Blob).arrayBuffer());

      // Upload file to Firebase storage
      const storageRef = ref(storage, "application/" + filename);
      await uploadBytes(storageRef, buffer);

      // Get download URL from Firebase storage
      image = await getDownloadURL(storageRef);
    }

    const updatedData: Record<string, string> = {};

    // Iterate through form data and add it to updatedData
    formData.forEach((value, key) => {
      // Exclude the id field from updatedData
      if (key !== "id" && key !== "image") {
        updatedData[key] = value.toString();
      } else if (key === "image" && image) {
        // Add the image download URL to updatedData
        updatedData[key] = image; // Replace "downloadURL" with your actual variable
      }
    });

    if (userEmail === admin) {
      // Update the application with the provided data (including imageURL)
      const response = await prisma.application.update({
        where: {
          id: id,
        },
        data: updatedData,
      });

      if (response) {
        return new NextResponse(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      return new NextResponse(
        "You do not have permission to update this item.",
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Error updating application:", error);
    return new NextResponse("Error updating application");
  }
}
