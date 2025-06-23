import bg from "../assets/bg1.png"

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image Layer */}
      {/* <div className="absolute inset-0 z-0">
        <img src={bg} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 bg-black opacity-55" />
      </div> */}

      {/* Foreground Content */}
      <div className="relative z-10 flex justify-center items-center h-full w-full">
        <div className="text-center text-white ">
          <h1 className="text-3xl font-barrio font-bold">
            Your Squad
          </h1>
          <h1 className="text-3xl font-barrio font-bold">
            Your Strategy 
          </h1>
          <h1 className="text-5xl font-barrio font-bold">
            Build It Live!
          </h1>
          <button className="font-rubik mt-3 px-6 py-2 text-white hover:bg-white hover:text-black border border-white rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
