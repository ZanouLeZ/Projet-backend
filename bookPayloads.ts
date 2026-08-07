import express from "express";

const parseBookPayload = (req: express.Request) => {
  const body = req.body ?? {};
  const candidate = typeof body === "object" && body !== null ? body : {};

  if (candidate.book && typeof candidate.book === "string") {
    try {
      return JSON.parse(candidate.book);
    } catch {
      return candidate;
    }
  }

  if (candidate.book && typeof candidate.book === "object") {
    return candidate.book;
  }

  return candidate;
};

const normalizeBookPayload = (
  req: express.Request,
  existingBook?: {
    imageUrl?: string | number | null;
    ratings?: Array<{ userId?: string | number; grade?: number | string }>;
  },
) => {
  const payload = parseBookPayload(req) as Record<string, any>;
  const authenticatedUserId = req.user?._id
    ? String(req.user._id)
    : "anonymous";
  const existingRatings = Array.isArray(existingBook?.ratings)
    ? existingBook.ratings
    : [];
  const inputRatings = Array.isArray(payload.ratings)
    ? payload.ratings
    : existingRatings;
  const firstRating = inputRatings[0] ?? {};

  const normalizedRatings = inputRatings.map((rating: any) => ({
    userId: authenticatedUserId,
    grade: Number(rating.grade ?? 0),
  }));

  if (payload.rating !== undefined && normalizedRatings.length === 0) {
    normalizedRatings.push({
      userId: authenticatedUserId,
      grade: Number(payload.rating ?? 0),
    });
  }

  const averageRating = Number(
    payload.averageRating ?? payload.rating ?? firstRating.grade ?? 0,
  );

  // URL de l'image uploadée par Multer
  const uploadedImageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    : undefined;

  const explicitImageRemoval =
    payload.imageUrl === "" || payload.imageUrl === null;

  const resolvedImageUrl = uploadedImageUrl
    ? uploadedImageUrl
    : explicitImageRemoval
      ? ""
      : (payload.imageUrl ??
        existingBook?.imageUrl ??
        "https://via.placeholder.com/300x450?text=Book");

  return {
    userId: authenticatedUserId,
    title: payload.title ?? "Sans titre",
    author: payload.author ?? "Auteur inconnu",
    imageUrl: resolvedImageUrl,
    year: Number(payload.year ?? 0),
    genre: payload.genre ?? "Non spécifié",
    ratings: normalizedRatings,
    averageRating: normalizedRatings.length
      ? normalizedRatings.reduce(
          (sum, item) => sum + Number(item.grade || 0),
          0,
        ) / normalizedRatings.length
      : averageRating,
  };
};

export default normalizeBookPayload;
