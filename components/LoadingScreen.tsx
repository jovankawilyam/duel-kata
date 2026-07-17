export default function LoadingScreen({
  status,
  onRetry,
}: {
  status: string;
  onRetry?: () => void;
}) {
  const isError = status.includes("Gagal");
  return (
    <div className="min-h-screen-dynamic fixed inset-0 z-[300] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="text-center">
        {!isError && (
          <div className="w-20 h-20 md:w-24 md:h-24 border-[6px] md:border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6 shadow-lg" />
        )}
        {isError && <div className="text-6xl mb-4">😵</div>}
        <h2 className="text-2xl md:text-3xl font-black text-indigo-700 mb-2">
          {isError ? "Gagal Memuat Kamus" : "Memuat Kamus KBBI..."}
        </h2>
        <p className="text-gray-700 text-base md:text-lg font-semibold mb-6">
          {status}
        </p>
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-base"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
