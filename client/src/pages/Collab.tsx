import { useCallback, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { debounce } from "lodash";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { BASE_URL, getHeaders } from "../api/urls";
import { setExcalidrawAPI } from "../redux/slices/excalidrawSlice";
import axios from "axios";

const socket = io(BASE_URL);

function Collab() {
  const { excalidrawAPI } = useAppSelector((state) => state.excalidraw);
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.projects.currentProject);
  const [fetchOnce, setFetchOnce] = useState<boolean>(false);

  useEffect(() => {
    socket.emit("join-room", project?._id);
  }, [project]);

  const debouncedUpdateScene = debounce((scene: any) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 2000);

  socket?.on(
    "set-initial-data",
    (scene: readonly ExcalidrawElement[] | null) => {
      debouncedUpdateScene(scene);
    }
  );

  socket?.on("receive-data", (scene: readonly ExcalidrawElement[] | null) => {
    debouncedUpdateScene(scene);
  });

  useEffect(() => {
    if(!project?._id) return;
    const fetchDocument = async () => {
      axios
        .get(`http://localhost:5000/api/projects/${project?._id}/excalidraws`, {
          headers: getHeaders(),
        })
        .then((res) => {
          const data = res?.data;
          console.log(res?.data);
          if (fetchOnce) return;
          if (
            excalidrawAPI &&
            Array.isArray(data.elements) &&
            data.elements.length !== 0
          ) {
            excalidrawAPI.updateScene(data);
            console.log("updated? ");
          } else console.log("excalidrawAPI is not updated.");
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
        });
    };
    if (!fetchOnce) {
      fetchDocument();
      setFetchOnce(true);
    }
  }, [excalidrawAPI, fetchOnce, project?._id]);

  // const handleDataChange = useCallback(
  //   (elements: readonly ExcalidrawElement[] | null) => {
  //     if (excalidrawAPI) {
  //       const data = {
  //         elements,
  //         projectId: project?._id,
  //       };

  //       socket?.emit("send-data", data);

  //       // if (Array.isArray(elements) && elements.length !== 0) {
  //       //   socket.emit("save-draw", data);
  //       //   console.log(data);
  //       // }
  //     } else {
  //       console.log(
  //         "excalidrawAPI or excalidrawData is falsy when sending data"
  //       );
  //     }
  //   },
  //   [project?._id]
  // );

  const handleDataChange = (elements: readonly ExcalidrawElement[] | null) => {
    if (excalidrawAPI) {
      const data = {
        elements,
        projectId: project?._id,
      };

      socket?.emit("send-data", data);

      if (Array.isArray(elements) && elements.length !== 0) {
        socket.emit("save-draw", data);
      }
    } else {
      console.log("excalidrawAPI or excalidrawData is falsy when sending data");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen w-11/12 transition-all duration-200 ease-out">
        <div
          style={{
            height: "88%",
            width: "100%",
          }}
        >
          <Excalidraw
            excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
              dispatch(setExcalidrawAPI(api));
            }}
            onChange={handleDataChange}
          />
        </div>
      </div>
    </>
  );
}

export default Collab;
