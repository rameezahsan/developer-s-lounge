import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGithubRepos } from '../../actions/profile';
import Spinner from '../layout/Spinner';

const ProfileGithub = ({ githubusername, getGithubRepos, repos }) => {
  useEffect(() => {
    getGithubRepos(githubusername);
  }, []);

  return (
    <div className='profile-github'>
      <h2 className='text-primary my-1'>Github repos</h2>
      {repos === null ? (
        <Spinner />
      ) : (
        repos.map((repo) => (
          <div key={repo._id} className='repo bg-white p-1 my-1'>
            <div>
              <h4>
                {' '}
                <a
                  href={repo.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {repo.name}
                </a>
              </h4>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  repos: state.profile.repos,
});

ProfileGithub.propTypes = {
  getGithubRepos: PropTypes.func.isRequired,
  repos: PropTypes.array.isRequired,
  githubusername: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, { getGithubRepos })(ProfileGithub);
