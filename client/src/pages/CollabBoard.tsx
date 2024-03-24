import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import axios from "axios";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { debounce } from "lodash";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { BASE_URL, getExcalidraws, getHeaders } from "../api/urls";
import { setExcalidrawAPI } from "../redux/slices/excalidrawSlice";

const socket = io(BASE_URL);

function Collab() {
  const { excalidrawAPI } = useAppSelector((state) => state.excalidraw);
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.projects.currentProject);
  const [fetchOnce, setFetchOnce] = useState<boolean>(false);
  const [saveDrawDebounced] = useState(() =>
    debounce((data) => {
      socket.emit("save-draw", data);
    }, 3000)
  );

  useEffect(() => {
    socket.emit("join-room", project?._id);
  }, [project]);

  const debouncedUpdateScene = debounce((scene: any) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 1000);

  // socket?.on(
  //   "set-initial-data",
  //   (scene: readonly ExcalidrawElement[] | null) => {
  //     debouncedUpdateScene(scene);
  //   }
  // );

  socket?.on("receive-data", (scene: readonly ExcalidrawElement[] | null) => {
    debouncedUpdateScene(scene);
  });

  useEffect(() => {
    if (!project?._id) return;
    const fetchDocument = async () => {
      axios
        .get(getExcalidraws(project._id), {
          headers: getHeaders(),
        })
        .then((res) => {
          const data = res?.data;
          if (fetchOnce) return;
          if (
            excalidrawAPI &&
            Array.isArray(data.elements) &&
            data.elements.length !== 0
          ) {
            excalidrawAPI.updateScene(data);
          }
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

  const handleDataChange = (elements: readonly ExcalidrawElement[] | null) => {
    if (excalidrawAPI) {
      const data = {
        elements,
        projectId: project?._id,
      };

      socket?.emit("send-data", data);

      if (Array.isArray(elements) && elements.length !== 0) {
        saveDrawDebounced(data);
      }
    } else {
      console.log("excalidrawAPI or excalidrawData is falsy when sending data");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-[90vh] transition-all duration-200 ease-out">
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
