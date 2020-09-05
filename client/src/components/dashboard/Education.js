import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import { deleteEducation } from '../../actions/profile';

const Education = ({ education, deleteEducation }) => {
  const educationHistory = education.map((edu) => (
    <tr key={edu._id}>
      <td>{edu.school} </td>
      <td className='hide-sm'>{edu.degree}</td>
      <td>
        <Moment format='DD/MM/YYYY'>{edu.from}</Moment> -{' '}
        {edu.to === null ? (
          'now'
        ) : (
          <Moment format='DD/MM/YYYY'>{edu.to}</Moment>
        )}{' '}
      </td>
      <td>
        <button
          className='btn btn-danger'
          onClick={() => deleteEducation(edu._id)}
        >
          delete
        </button>
      </td>
    </tr>
  ));
  return (
    <Fragment>
      <h2 className='my-2'>Your Education</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>School/College</th>
            <th className='hide-sm'>Degree</th>
            <th>Years</th>
            <th />
          </tr>
        </thead>

        <tbody>{educationHistory}</tbody>
      </table>
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEducation: PropTypes.func.isRequired,
};

export default connect(null, { deleteEducation })(Education);
