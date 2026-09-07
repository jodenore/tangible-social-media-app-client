import { Link } from "react-router-dom";

import "./ProfileMediaGrid.css";

function getInitial(label) {
  return label?.slice(0, 1).toUpperCase() || "?";
}

function ProfileMediaGrid({ items, getImage, getLabel, getPath }) {
  return (
    <div className="profile-media-grid">
      {items.map((item) => {
        const label = getLabel(item);
        const image = getImage(item);

        return (
          <Link
            key={item._id}
            to={getPath(item)}
            className="profile-media-grid-item"
            aria-label={`View ${label}`}
          >
            {image ? (
              <img src={image} alt="" />
            ) : (
              <span aria-hidden="true">{getInitial(label)}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileMediaGrid;
