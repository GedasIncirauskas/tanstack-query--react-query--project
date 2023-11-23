import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  function handleSubmit(formData) {}

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
