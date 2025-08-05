import Image from "next/image";

import { FirmaConUrl } from "@/types";

const LoadingImage = () => (
  <div className="w-[150px] h-[50px] bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
  </div>
);

const ErrorImage = () => (
  <div className="w-[150px] h-[50px] bg-red-100 rounded-lg flex items-center justify-center">
    <span className="text-xs text-red-600">Error al cargar</span>
  </div>
);

const SignatureImage = ({ firma }: { firma: FirmaConUrl }) => (
  <div className="mt-2">
    {firma.urlLoading && <LoadingImage />}
    {firma.urlError && <ErrorImage />}
    {firma.presignedUrl && !firma.urlLoading && !firma.urlError && (
      <div>
        <Image
          alt="Firma digital"
          className="mx-auto"
          height={300}
          src={firma.presignedUrl}
          width={300}
        />
      </div>
    )}
  </div>
);

export default SignatureImage;
