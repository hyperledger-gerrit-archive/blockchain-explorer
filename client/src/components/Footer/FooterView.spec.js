import FooterView from './FooterView';

const setup = () => {
  const wrapper = shallow(<FooterView />);

  return {
    wrapper
  };
};

describe('FooterView', () => {
  test('FooterView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
