export type HeroBannerResponse = {
  id: number;
  url: string;
  targetUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HeroBannerRequest = {
  image?: File | null;
  targetUrl?: string;
};
