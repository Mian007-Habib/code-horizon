import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

const getInitialState = () => {
  // if we're on the server, return default values 
  //We use it to avoid errors. Let’s say you’re making a code editor that remembers your theme (dark/light) and font size. You save that info in the browser using localStorage.But when your app runs on the server, there’s no localStorage. Then, when the page comes to the browser, you can load the user’s saved settings.


  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

// This line creates a custom Zustand store.It keeps track of your editor's state — like language, output, errors, etc.
export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {  
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "", //This is a function inside the store that gets the current code from the editor.If there’s no editor, it just returns an empty string.

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
       if (savedCode) editor.setValue(savedCode);
      

      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    //The runCode function executes the code that the user has written in the editor. It communicates with an API (in this case, Piston API via emkc.org) to execute the code and return the results.

    //Checks if the user has entered code.
    //Sends the code to a server (Piston API) for execution based on the selected language.
    //Updates the UI to show the loading state, output, or any errors.
    runCode: async () => {
     const {language, getCode} = get();
     const code = getCode();

     if(!code){
      set({error: "Please enter some code to run."})
      return
     }

     set({isRunning: true, error:null, output:""})
     try{ const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: code }],
        }),
      });

      const data = await response.json();

        console.log("data back from piston:", data);

          // handle API-level erros
          if (data.message) {
            set({ error: data.message, executionResult: { code, output: "", error: data.message } });
            return;
          }

           // handle compilation errors
           //You first check for any top-level error (like data.message).
           //Then you check for compile-time errors.
           //Then for run-time errors.
           //If everything's fine → you'll process the successful result (probably next in your code).
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

         // if we get here, execution was successful
         const output = data.run.output;

         set({
           output: output.trim(),
           error: null,
           executionResult: {
             code,
             output: output.trim(),
             error: null,
           },
         });
  

     } catch(error) {
   
      console.log("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }

    },
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;


