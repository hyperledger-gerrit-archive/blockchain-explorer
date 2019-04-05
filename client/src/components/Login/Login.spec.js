import Login from './Login';

const setup = () => {
  const props = {
    classes: {
      avatar: 'avatar',
      form: 'form',
      container: 'container',
      paper: 'paper',
      submit: 'submit'
    }
  };
  const wrapper = shallow(<Login {...props} />);

  return {
    wrapper,
    props
  };
};

describe('Login', () => {
  test('Login component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('Login state should pass values', () => {
    const { wrapper } = setup();
    wrapper.setState({
      user: 'admin',
      password: 'adminpw',
      network: 'first-network',
      networks: ['first-network', 'balance-transfer'],
      isLoading: 'true'
    });
    wrapper.update();
    expect(wrapper.exists()).toBe(true);
  });
});
