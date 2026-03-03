import { useParams } from "react-router-dom";

// Video.jsx
const Video = ({ sidebar }) => {
  const { videoId } = useParams();

  return (
    <div className="played-container">
      <PlayVideo sidebar={sidebar} videoId={videoId} />
    </div>
  );
};

export default Video;
