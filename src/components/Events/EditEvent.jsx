import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, updateEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";

import { client } from "../../utils/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await client.cancelQueries({ queryKey: ["event", { id }] });

      const previousEvent = client.getQueryData(["event", { id }]);
      client.setQueryData(["event", { id }], data.event);

      return { previousEvent }; //will be a context below
    },
    onError: (error, data, context) => {
      client.setQueryData(["event", { id }], context.previousEvent);
    },
    onSettled: () => {
      client.invalidateQueries(["event", { id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event, please check your inputs"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Ok
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
