import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { deleteComment } from '../../actions/post';
const CommentItem = ({
  comment: { _id, user, text, name, date },
  auth,
  postId,
  deleteComment,
}) => {
  return (
    <div className='post bg-white p-1 my-2'>
      <div>
        <Link to={`/profile/${user}`}>
          <img
            className='round-img'
            src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200'
            alt=''
          />
          <h4>{name}</h4>
        </Link>
      </div>
      <div>
        <p className='my-1'>{text}</p>
        <p className='post-date'>
          <Moment format='DD/MM/YYYY'>{date}</Moment>
        </p>

        {!auth.loading && auth.user._id === user && (
          <button
            className='btn btn-danger'
            type='button'
            onClick={(e) => deleteComment(postId, _id)}
          >
            <i className='fas fa-times'></i>
          </button>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});
CommentItem.propTypes = {
  postId: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { deleteComment })(CommentItem);
