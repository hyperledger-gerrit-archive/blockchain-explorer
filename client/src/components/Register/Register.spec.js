import Register from './Register';

const setup = () => {
  const props = {
    classes: {
      form: 'form',
      container: 'container',
      paper: 'paper',
      actions: 'actions'
    },
    userInfo: [
      {
        user: 'admin',
        password: 'adminpw',
        affiliation: 'test',
        roles: 'admin'
      }
    ]
  };
  const wrapper = shallow(<Register {...props} />);

  return {
    wrapper,
    props
  };
};

describe('Register', () => {
  test('Register component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('Register state should pass values', () => {
    const { wrapper } = setup();
    wrapper.setState({
      user: 'admin',
      password: 'adminpw',
      affiliation: 'test',
      roles: 'admin',
      rolesList: ['admin', 'reader', 'writer'],
      isLoading: 'true'
    });
    wrapper.update();
    expect(wrapper.exists()).toBe(true);
  });
});
