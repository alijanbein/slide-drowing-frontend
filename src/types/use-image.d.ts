declare module "use-image" {
  const useImage: (
    url: string,
    crossOrigin?: string,
  ) => [HTMLImageElement | undefined, "loaded" | "loading" | "failed"];
  export default useImage;
}
