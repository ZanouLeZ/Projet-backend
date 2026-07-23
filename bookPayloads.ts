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

const normalizeBookPayload = (req: express.Request) => {
  const payload = parseBookPayload(req) as Record<string, any>;
  const inputRatings = Array.isArray(payload.ratings) ? payload.ratings : [];
  const firstRating = inputRatings[0] ?? {};

  const normalizedRatings = inputRatings.map((rating: any) => ({
    userId: rating.userId ?? payload.userId ?? "anonymous",
    grade: Number(rating.grade ?? 0),
  }));

  if (payload.rating !== undefined && normalizedRatings.length === 0) {
    normalizedRatings.push({
      userId: payload.userId ?? "anonymous",
      grade: Number(payload.rating ?? 0),
    });
  }

  const averageRating = Number(
    payload.averageRating ?? payload.rating ?? firstRating.grade ?? 0,
  );

  return {
    userId: payload.userId ?? "anonymous",
    title: payload.title ?? "Sans titre",
    author: payload.author ?? "Auteur inconnu",
    imageUrl:
      payload.imageUrl ?? "https://via.placeholder.com/300x450?text=Book",
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
