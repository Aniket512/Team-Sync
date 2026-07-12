import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { debounce } from "lodash";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getExcalidraws } from "../api/urls";
import { setExcalidrawAPI } from "../redux/slices/excalidrawSlice";
import { socket } from "../configs/SocketProvider";
import apiClient from "../api/apiClient";

function Collab() {
  const { excalidrawAPI } = useAppSelector((state) => state.excalidraw);
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.projects.currentProject);
  const [fetchOnce, setFetchOnce] = useState<boolean>(false);
  const [saveDrawDebounced] = useState(() =>
    debounce((data) => {
      socket.emit("save-draw", data);
    }, 1000)
  );

  useEffect(() => {
    if (project?._id) {
      socket.emit("join-room", project._id);
    }
  }, [project?._id]);

  const debouncedUpdateScene = debounce((scene: any) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 1000);

  useEffect(() => {
    const handleReceiveData = (scene: readonly ExcalidrawElement[] | null) => {
      debouncedUpdateScene(scene);
    };

    socket.on("receive-data", handleReceiveData);
    return () => {
      socket.off("receive-data", handleReceiveData);
    };
  }, [debouncedUpdateScene]);

  useEffect(() => {
    if (!project?._id) return;
    const fetchDocument = async () => {
      apiClient
        .get(getExcalidraws(project._id))
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
