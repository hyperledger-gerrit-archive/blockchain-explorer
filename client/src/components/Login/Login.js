import React, { Component } from 'react';

import compose from 'recompose/compose';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import PersonIcon from '@material-ui/icons/Person';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { shape, string } from 'prop-types';

import { authSelectors, authOperations } from '../../state/redux/auth';

const styles = theme => ({
  container: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});

export class Login extends Component {
  static propTypes = {
    classes: shape({
      avatar: string,
      form: string,
      container: string,
      paper: string,
      submit: string
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      name: {
        error: null,
        value: ''
      },
      password: {
        error: null,
        value: ''
      },
      isLoading: false
    };
  }

  handleChange = event => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value
    });
  };

  submitForm = async e => {
    e.preventDefault();

    const { login } = this.props;
    const { name, password } = this.state;
    await login({ name, password });

    const { history } = this.props;
    history.push('/');
    return true;
  };

  render() {
    const { name, password, isLoading } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h5" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} onSubmit={this.submitForm}>
            <FormControl margin="normal" required fullWidth>
              <TextField
                error={!!name.error}
                required
                fullWidth
                id="name"
                name="name"
                label="Name"
                disabled={isLoading}
                value={name.value}
                onChange={e => this.handleChange(e)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                  shrink: true
                }}
              />
              {name.error && (
                <FormHelperText id="component-error-text" error>
                  {name.error}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <TextField
                required
                fullWidth
                error={!!password.error}
                id="password"
                type="password"
                name="password"
                label="Password"
                disabled={isLoading}
                value={password.value}
                onChange={e => this.handleChange(e)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  shrink: true
                }}
              />
              {password.error && (
                <FormHelperText id="component-error-text" error>
                  {password.error}
                </FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign in
            </Button>
          </form>
        </Paper>
      </div>
    );
  }
}

const { authSelector } = authSelectors;

export default compose(
  withStyles(styles),
  connect(
    state => ({
      auth: authSelector(state)
    }),
    {
      login: authOperations.login
    }
  )
)(Login);
