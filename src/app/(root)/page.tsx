import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";

export default function Home() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#090c17] via-[#141627] to-[#1a1d36]">
        <div className="max-w-[1800px] mx-auto p-4">
          <Header/>
  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EditorPanel/>
            <OutputPanel/>
  
          </div>
  
        </div>
   
      </div>
    );
  }
  
  